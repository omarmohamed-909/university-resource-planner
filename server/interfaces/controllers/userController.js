class UserController {
  constructor({ userUseCase }) {
    this.userUseCase = userUseCase;
  }

  async list(req, res, next) {
    try {
      const { parsePagination } = require('../http/queryPagination');
      const { page, limit } = parsePagination(req.query);
      const result = await this.userUseCase.list({
        role: req.query.role,
        search: req.query.search,
        page,
        limit,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await this.userUseCase.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await this.userUseCase.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const user = await this.userUseCase.update(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
