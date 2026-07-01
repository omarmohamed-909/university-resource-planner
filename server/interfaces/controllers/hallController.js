class HallController {
  constructor({ createHallUseCase, getAvailableHallsUseCase, hallRepository }) {
    this.createHallUseCase = createHallUseCase;
    this.getAvailableHallsUseCase = getAvailableHallsUseCase;
    this.hallRepository = hallRepository;
  }

  async create(req, res, next) {
    try {
      const result = await this.createHallUseCase.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const filter = {};
      if (req.query.type) filter.type = req.query.type;
      if (req.query.status) filter.status = req.query.status;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      if (req.query.page) {
        const result = await this.hallRepository.findAllPaginated(filter, page, limit);
        return res.json({ success: true, ...result });
      }
      const halls = await this.hallRepository.findAll(filter);
      res.json({ success: true, data: halls });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const hall = await this.hallRepository.findById(req.params.id);
      if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
      res.json({ success: true, data: hall });
    } catch (error) {
      next(error);
    }
  }

  async getAvailable(req, res, next) {
    try {
      const halls = await this.getAvailableHallsUseCase.execute(req.query);
      res.json({ success: true, data: halls });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const hall = await this.hallRepository.update(req.params.id, req.body);
      if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
      res.json({ success: true, data: hall });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.hallRepository.delete(req.params.id);
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HallController;
