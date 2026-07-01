'use strict';
const Schedule = require('../../../domain/entities/scheduleEntity');
const GeneticScheduler = require('../../../domain/services/GeneticScheduler');
const { DAYS, DAY_LABELS } = GeneticScheduler;

class AutoGenerateScheduleUseCase {
  constructor({ scheduleRepository, hallRepository, courseRepository, socketService }) {
    this.scheduleRepository = scheduleRepository;
    this.hallRepository     = hallRepository;
    this.courseRepository   = courseRepository;
    this.socketService      = socketService;
  }

  /**
   * @param {object} params
   * @param {string}  params.semester
   * @param {boolean} params.dryRun          – preview only, no DB writes
   * @param {number}  params.populationSize
   * @param {number}  params.maxGenerations
   * @param {number}  params.mutationRate
   */
  async execute({ semester, dryRun = false, populationSize, maxGenerations, mutationRate } = {}) {
    if (!semester) throw new Error('الفصل الدراسي مطلوب');

    const [halls, courses, existing] = await Promise.all([
      this.hallRepository.findAll({ status: 'active' }),
      this.courseRepository.findAll(),
      this.scheduleRepository.findBySemester(semester),
    ]);

    if (!halls.length)   throw new Error('لا توجد قاعات دراسية نشطة');
    if (!courses.length) throw new Error('لا توجد مواد دراسية لجدولتها');

    // Run GA
    const ga = new GeneticScheduler({
      ...(populationSize  && { populationSize }),
      ...(maxGenerations  && { maxGenerations }),
      ...(mutationRate    && { mutationRate }),
    });

    const { scheduled, unscheduled, convergence, bestFitness, generationsRun } = await ga.run(courses, halls);

    const analytics = this._analytics(scheduled, courses, halls, convergence, bestFitness, generationsRun);

    // Enrich preview items
    const courseMap = new Map(courses.map(c => [String(c.id), c]));
    const hallMap   = new Map(halls.map(h => [String(h.id), h]));
    const enrich    = item => {
      const c = courseMap.get(String(item.courseId));
      const h = hallMap.get(String(item.hallId));
      return {
        ...item,
        courseName: c?.name || '—', courseCode: c?.code || '—',
        hallName:   h?.name || '—', hallCapacity: h?.capacity || 0,
        students:   c?.getStudentCount() || 0,
        dayLabel:   DAY_LABELS[item.day] || item.day,
      };
    };

    // ── Dry-run or conflict → return preview, no save ────────────────────────
    if (dryRun || unscheduled.length > 0) {
      return {
        schedules:        existing,
        generatedPreview: scheduled.map(enrich),
        unscheduled, analytics,
        applied: false, dryRun: true,
        message: unscheduled.length > 0
          ? 'لم يتم التطبيق — بعض المواد لم تُجدَّل'
          : 'معاينة فقط — لم يتم الحفظ',
      };
    }

    // ── Apply ────────────────────────────────────────────────────────────────
    // ملاحظة: transactions تحتاج Replica Set — للإنتاج فقط
    if (existing.length) {
      await this.scheduleRepository.deleteMany({ semester });
    }

    const savedSchedules = [];
    for (const item of scheduled) {
      const saved = await this.scheduleRepository.save(
        new Schedule({ ...item, semester })
      );
      savedSchedules.push(saved);
    }

    this.socketService.broadcast('schedules:regenerated', {
      semester, count: savedSchedules.length, applied: true,
    });

    return { schedules: savedSchedules, unscheduled, analytics, applied: true };
  }

  _analytics(scheduled, courses, halls, convergence, bestFitness, generationsRun) {
    const hallMap = new Map(halls.map(h => [String(h.id), h]));
    const dayLoad = Object.fromEntries(DAYS.map(d => [d, 0]));
    const hallLoad = Object.fromEntries(halls.map(h => [String(h.id), 0]));

    scheduled.forEach(s => {
      if (dayLoad[s.day] !== undefined) dayLoad[s.day]++;
      if (hallLoad[String(s.hallId)] !== undefined) hallLoad[String(s.hallId)]++;
    });

    const totalSlots  = DAYS.length * 5 * halls.length;
    const utilization = totalSlots ? Math.round((scheduled.length / totalSlots) * 100) : 0;

    return {
      totalCourses:    courses.length,
      scheduledCount:  scheduled.length,
      totalSlots, utilization,
      dayDistribution: DAYS.map(d => ({ day: d, label: DAY_LABELS[d], count: dayLoad[d] })),
      hallUtilization: halls.map(h => ({
        hallId: h.id, hallName: h.name, capacity: h.capacity,
        count: hallLoad[String(h.id)], maxSlots: DAYS.length * 5,
      })),
      // GA-specific
      convergence, bestFitness, generationsRun,
    };
  }
}

module.exports = AutoGenerateScheduleUseCase;
