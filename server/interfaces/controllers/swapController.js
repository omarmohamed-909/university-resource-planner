class SwapController {
  constructor({ createSwapRequestUseCase, respondToSwapUseCase, swapRepository }) {
    this.createSwapRequestUseCase = createSwapRequestUseCase;
    this.respondToSwapUseCase = respondToSwapUseCase;
    this.swapRepository = swapRepository;
  }

  async request(req, res, next) {
    try {
      const result = await this.createSwapRequestUseCase.execute({
        ...req.body,
        requesterId: req.user.id,
        requesterRole: req.user.role
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const filter = {};
      if (req.user.role === 'doctor') {
        filter.requesterId = req.user.id;
      }
      const swaps = await this.swapRepository.findAll(filter);
      res.json({ success: true, data: swaps });
    } catch (error) {
      next(error);
    }
  }

  async respond(req, res, next) {
    try {
      const result = await this.respondToSwapUseCase.execute({
        swapId: req.params.id,
        action: req.body.action
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SwapController;
