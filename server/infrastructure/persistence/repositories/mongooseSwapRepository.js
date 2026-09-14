const SwapRequestModel = require('../models/swapRequestModel');

class MongooseSwapRepository {
  queryWithRelations(query) {
    return query
      .populate('requesterId', 'name email role department')
      .populate('proposedHallId')
      .populate({
        path: 'originalScheduleId',
        populate: [
          { path: 'courseId' },
          { path: 'hallId' }
        ]
      });
  }

  async findById(id) {
    const doc = await this.queryWithRelations(SwapRequestModel.findById(id)).lean();
    if (!doc) return null;
    return { id: doc._id.toString(), ...doc, _id: undefined };
  }

  async findAll(filter = {}) {
    const docs = await this.queryWithRelations(SwapRequestModel.find(filter).sort({ createdAt: -1 })).lean();
    return docs.map(doc => ({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async findAllPaginated(filter = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      this.queryWithRelations(SwapRequestModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit)).lean(),
      SwapRequestModel.countDocuments(filter),
    ]);
    return {
      data: docs.map(doc => ({ id: doc._id.toString(), ...doc, _id: undefined })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async save(data) {
    const doc = await SwapRequestModel.create(data);
    const populated = await this.queryWithRelations(SwapRequestModel.findById(doc._id)).lean();
    return { id: populated._id.toString(), ...populated, _id: undefined };
  }

  async update(id, data) {
    const doc = await this.queryWithRelations(SwapRequestModel.findByIdAndUpdate(id, data, { new: true })).lean();
    if (!doc) return null;
    return { id: doc._id.toString(), ...doc, _id: undefined };
  }
}

module.exports = MongooseSwapRepository;
