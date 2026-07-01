'use strict';
/**
 * GeneticScheduler — University Timetabling via Genetic Algorithm
 *
 * Chromosome: array of genes, one per course
 * Gene: { courseId, hallId, day, startTime, endTime }
 *
 * Fitness (maximise):
 *   Hard constraints (heavy penalty):
 *     -1000  hall occupied at same slot
 *     -1000  doctor occupied at same slot
 *     -800   hall capacity insufficient
 *   Soft constraints (rewards / penalties):
 *     +100   valid capacity
 *     +30*u  utilisation bonus (u = students/capacity)
 *     -15*(max_day - min_day)  day-spread penalty
 */

const TIME_SLOTS = [
  { startTime: '08:00', endTime: '09:30' },
  { startTime: '09:45', endTime: '11:15' },
  { startTime: '11:30', endTime: '13:00' },
  { startTime: '13:15', endTime: '14:45' },
  { startTime: '15:00', endTime: '16:30' },
];

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

const DAY_LABELS = {
  saturday: 'السبت', sunday: 'الأحد', monday: 'الاثنين',
  tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس',
};

class GeneticScheduler {
  /**
   * @param {object} opts
   * @param {number} opts.populationSize
   * @param {number} opts.maxGenerations
   * @param {number} opts.mutationRate   0–1
   * @param {number} opts.eliteCount
   * @param {number} opts.tournamentSize
   * @param {number} opts.earlyStopAfter generations with no improvement before stopping
   */
  constructor({
    populationSize  = 80,
    maxGenerations  = 250,
    mutationRate    = 0.05,
    eliteCount      = 2,
    tournamentSize  = 5,
    earlyStopAfter  = 50,
  } = {}) {
    this.populationSize  = populationSize;
    this.maxGenerations  = maxGenerations;
    this.mutationRate    = mutationRate;
    this.eliteCount      = eliteCount;
    this.tournamentSize  = tournamentSize;
    this.earlyStopAfter  = earlyStopAfter;
  }

  /**
   * Main entry point.
   * @returns {Promise<{ scheduled, unscheduled, convergence, bestFitness, generationsRun }>}
   */
  async run(courses, halls) {
    if (!courses.length || !halls.length) {
      return { scheduled: [], unscheduled: courses, convergence: [], bestFitness: -Infinity, generationsRun: 0 };
    }

    // Pre-compute lookups
    this._courseMap   = new Map(courses.map(c => [String(c.id), c]));
    this._hallMap     = new Map(halls.map(h => [String(h.id), h]));
    this._validHalls  = new Map(
      courses.map(c => {
        const ok = halls.filter(h => h.capacity >= c.getStudentCount());
        return [String(c.id), ok.length ? ok : halls];
      })
    );
    this._courses = courses;
    this._halls   = halls;

    // Initialise population
    let population = Array.from({ length: this.populationSize }, () => this._random());

    const convergence = [];
    let bestChromosome  = null;
    let bestFitness     = -Infinity;
    let noImprove       = 0;
    let generationsRun  = 0;

    for (let gen = 0; gen < this.maxGenerations; gen++) {
      generationsRun = gen + 1;

      // Evaluate & sort
      const scored = population
        .map(ch => ({ ch, f: this._fitness(ch) }))
        .sort((a, b) => b.f - a.f);

      if (scored[0].f > bestFitness) {
        bestFitness    = scored[0].f;
        bestChromosome = scored[0].ch;
        noImprove      = 0;
      } else {
        noImprove++;
      }

      // Record every 10 gens
      if (gen % 10 === 0 || gen === this.maxGenerations - 1) {
        const avg = scored.reduce((s, e) => s + e.f, 0) / scored.length;
        convergence.push({ gen, best: Math.round(bestFitness), avg: Math.round(avg) });
      }

      if (noImprove >= this.earlyStopAfter) break;

      // Yield event loop every 5 generations to prevent blocking the server
      if (gen % 5 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }

      // Elitism + next generation
      const next = scored.slice(0, this.eliteCount).map(e => e.ch);
      while (next.length < this.populationSize) {
        const p1 = this._select(scored);
        const p2 = this._select(scored);
        const [c1, c2] = this._crossover(p1, p2);
        next.push(this._mutate(c1));
        if (next.length < this.populationSize) next.push(this._mutate(c2));
      }
      population = next;
    }

    return { ...this._decode(bestChromosome), convergence, bestFitness, generationsRun };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  _random() {
    return this._courses.map(course => {
      const halls  = this._validHalls.get(String(course.id));
      const hall   = halls[Math.floor(Math.random() * halls.length)];
      const day    = DAYS[Math.floor(Math.random() * DAYS.length)];
      const slot   = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
      return { courseId: course.id, hallId: hall.id, day, startTime: slot.startTime, endTime: slot.endTime };
    });
  }

  _fitness(chromosome) {
    let score = 0;
    const hallSlots   = {};
    const doctorSlots = {};
    const dayCounts   = Object.fromEntries(DAYS.map(d => [d, 0]));

    for (const gene of chromosome) {
      const course = this._courseMap.get(String(gene.courseId));
      const hall   = this._hallMap.get(String(gene.hallId));
      if (!course || !hall) { score -= 2000; continue; }

      // Capacity
      if (hall.capacity < course.getStudentCount()) {
        score -= 800;
      } else {
        score += 100;
        score += (course.getStudentCount() / hall.capacity) * 30;
      }

      // Hall conflict
      const hk = `${gene.hallId}|${gene.day}|${gene.startTime}`;
      if (hallSlots[hk]) score -= 1000 * hallSlots[hk];
      hallSlots[hk] = (hallSlots[hk] || 0) + 1;

      // Doctor conflict
      const dk = `${course.doctorId}|${gene.day}|${gene.startTime}`;
      if (doctorSlots[dk]) score -= 1000 * doctorSlots[dk];
      doctorSlots[dk] = (doctorSlots[dk] || 0) + 1;

      dayCounts[gene.day] = (dayCounts[gene.day] || 0) + 1;
    }

    // Day spread penalty
    const vals = Object.values(dayCounts);
    score -= (Math.max(...vals) - Math.min(...vals)) * 15;

    return score;
  }

  _select(scored) {
    let best = null;
    for (let i = 0; i < this.tournamentSize; i++) {
      const c = scored[Math.floor(Math.random() * scored.length)];
      if (!best || c.f > best.f) best = c;
    }
    return best.ch;
  }

  _crossover(p1, p2) {
    const pt = 1 + Math.floor(Math.random() * (p1.length - 1));
    return [
      [...p1.slice(0, pt), ...p2.slice(pt)],
      [...p2.slice(0, pt), ...p1.slice(pt)],
    ];
  }

  _mutate(chromosome) {
    return chromosome.map(gene => {
      if (Math.random() >= this.mutationRate) return gene;
      const halls = this._validHalls.get(String(gene.courseId));
      const hall  = halls[Math.floor(Math.random() * halls.length)];
      const day   = DAYS[Math.floor(Math.random() * DAYS.length)];
      const slot  = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
      return { courseId: gene.courseId, hallId: hall.id, day, startTime: slot.startTime, endTime: slot.endTime };
    });
  }

  _decode(chromosome) {
    const scheduled   = [];
    const unscheduled = [];
    const hallSlots   = new Set();
    const doctorSlots = new Set();

    for (const gene of chromosome) {
      const course = this._courseMap.get(String(gene.courseId));
      const hall   = this._hallMap.get(String(gene.hallId));
      const hk     = `${gene.hallId}|${gene.day}|${gene.startTime}`;
      const dk     = `${course?.doctorId}|${gene.day}|${gene.startTime}`;
      const capOk  = hall && course && hall.capacity >= course.getStudentCount();

      if (!hallSlots.has(hk) && !doctorSlots.has(dk) && capOk) {
        hallSlots.add(hk);
        doctorSlots.add(dk);
        scheduled.push({
          courseId: gene.courseId, hallId: gene.hallId,
          day: gene.day, startTime: gene.startTime, endTime: gene.endTime,
          weekPattern: 'weekly',
        });
      } else {
        unscheduled.push({
          id: course?.id, code: course?.code, name: course?.name,
          students: course?.getStudentCount(),
          reason: !capOk ? 'سعة القاعة غير كافية'
            : hallSlots.has(hk) ? 'تعارض في القاعة'
            : 'تعارض في جدول الدكتور',
        });
      }
    }

    return { scheduled, unscheduled };
  }
}

GeneticScheduler.TIME_SLOTS = TIME_SLOTS;
GeneticScheduler.DAYS = DAYS;
GeneticScheduler.DAY_LABELS = DAY_LABELS;

module.exports = GeneticScheduler;
