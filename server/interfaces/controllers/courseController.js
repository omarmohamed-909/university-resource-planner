class CourseController {
  constructor({ courseUseCase }) {
    this.courseUseCase = courseUseCase;
  }

  async list(req, res, next) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : null;
      const limit = parseInt(req.query.limit, 10) || 20;
      const result = await this.courseUseCase.list({
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
      const course = await this.courseUseCase.getById(req.params.id);
      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
      res.json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const saved = await this.courseUseCase.create(req.body);
      res.status(201).json({ success: true, data: saved });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await this.courseUseCase.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, message: 'Course not found' });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await this.courseUseCase.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async enroll(req, res, next) {
    try {
      const updated = await this.courseUseCase.enroll(req.params.id, req.body.studentIds);
      if (!updated) return res.status(404).json({ success: false, message: 'Course not found' });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async unenroll(req, res, next) {
    try {
      const updated = await this.courseUseCase.unenroll(req.params.id, req.params.studentId);
      if (!updated) return res.status(404).json({ success: false, message: 'Course not found' });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CourseController;
