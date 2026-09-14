class SystemStatsController {
  constructor({ systemStatsUseCase }) {
    this.systemStatsUseCase = systemStatsUseCase;
  }

  async overview(req, res, next) {
    try {
      const data = await this.systemStatsUseCase.execute({ semester: req.query.semester });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SystemStatsController;
