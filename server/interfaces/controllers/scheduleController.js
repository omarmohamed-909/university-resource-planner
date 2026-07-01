class ScheduleController {
  constructor({ createScheduleUseCase, getScheduleUseCase, updateScheduleUseCase, deleteScheduleUseCase, autoGenerateScheduleUseCase, pdfExportService, excelExportService }) {
    this.createScheduleUseCase = createScheduleUseCase;
    this.getScheduleUseCase = getScheduleUseCase;
    this.updateScheduleUseCase = updateScheduleUseCase;
    this.deleteScheduleUseCase = deleteScheduleUseCase;
    this.autoGenerateScheduleUseCase = autoGenerateScheduleUseCase;
    this.pdfExportService = pdfExportService;
    this.excelExportService = excelExportService;
  }

  async create(req, res, next) {
    try {
      const result = await this.createScheduleUseCase.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { semester } = req.query;
      const page = req.query.page ? parseInt(req.query.page, 10) : null;
      const limit = parseInt(req.query.limit, 10) || 20;
      const result = await this.getScheduleUseCase.execute({
        semester,
        role: req.user.role,
        userId: req.user.id,
        page,
        limit
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const schedule = await this.getScheduleUseCase.getById(req.params.id);
      if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
      res.json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  async getByHall(req, res, next) {
    try {
      const schedules = await this.getScheduleUseCase.getByHall(req.params.hallId);
      res.json({ success: true, data: schedules });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await this.updateScheduleUseCase.execute(req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await this.deleteScheduleUseCase.execute(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async exportPdf(req, res, next) {
    try {
      const { semester } = req.query;
      const result = await this.getScheduleUseCase.execute({
        semester, role: req.user.role, userId: req.user.id, page: null, limit: 10000
      });
      const schedules = result.data || result || [];
      const buffer = await this.pdfExportService.exportSchedules(schedules);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="schedules.pdf"');
      res.send(buffer);
    } catch (error) { next(error); }
  }

  async exportExcel(req, res, next) {
    try {
      const { semester } = req.query;
      const result = await this.getScheduleUseCase.execute({
        semester, role: req.user.role, userId: req.user.id, page: null, limit: 10000
      });
      const schedules = result.data || result || [];
      const buffer = await this.excelExportService.exportSchedules(schedules);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="schedules.xlsx"');
      res.send(buffer);
    } catch (error) { next(error); }
  }

  async autoGenerate(req, res, next) {
    try {
      const { semester, dryRun, populationSize, maxGenerations, mutationRate } = req.body;

      // حدود لمنع DoS عبر معاملات GA ضخمة
      const safePopulation   = Math.min(Math.max(Number(populationSize)  || 50,  10), 200);
      const safeGenerations  = Math.min(Math.max(Number(maxGenerations)  || 100, 10), 500);
      const safeMutationRate = Math.min(Math.max(Number(mutationRate)    || 0.1, 0.01), 0.5);

      const result = await this.autoGenerateScheduleUseCase.execute({
        semester, dryRun: !!dryRun,
        populationSize: populationSize  ? safePopulation   : undefined,
        maxGenerations: maxGenerations  ? safeGenerations  : undefined,
        mutationRate:   mutationRate    ? safeMutationRate : undefined,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ScheduleController;
