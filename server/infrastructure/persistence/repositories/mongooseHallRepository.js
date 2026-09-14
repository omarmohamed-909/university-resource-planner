const HallModel = require('../models/hallModel');
const Hall = require('../../../domain/entities/hallEntity');

class MongooseHallRepository {
  async findById(id) {
    const doc = await HallModel.findById(id).lean();
    if (!doc) return null;
    return new Hall({ id: doc._id.toString(), ...doc, _id: undefined });
  }

  async findAll(filter = {}) {
    const docs = await HallModel.find(filter).lean();
    return docs.map(doc => new Hall({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async findAllPaginated(filter = {}, page = 1, limit = 20, search = '') {
    const normalizedSearch = String(search || '').trim();
    if (normalizedSearch) {
      const { escapeRegex } = require('../../../interfaces/http/queryPagination');
      const term = new RegExp(`^${escapeRegex(normalizedSearch)}`, 'i');
      filter = { ...filter, $or: [{ name: term }, { building: term }] };
    }
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      HallModel.find(filter).sort({ name: 1, _id: 1 }).skip(skip).limit(limit).lean(),
      HallModel.countDocuments(filter)
    ]);
    return {
      data: docs.map(doc => new Hall({ id: doc._id.toString(), ...doc, _id: undefined })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async count(filter = {}) {
    return HallModel.countDocuments(filter);
  }

  async findAvailable({ day, startTime, endTime, semester, excludeScheduleId } = {}) {
    const ScheduleModel = require('../models/scheduleModel');
    const query = { status: 'active' };

    if (!day || !startTime || !endTime) {
      const halls = await HallModel.find(query).lean();
      return halls.map(doc => new Hall({ id: doc._id.toString(), ...doc, _id: undefined }));
    }

    const scheduleQuery = {
      day,
      semester,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    };
    if (excludeScheduleId) {
      scheduleQuery._id = { $ne: excludeScheduleId };
    }
    const occupiedHallIds = await ScheduleModel.find(scheduleQuery).distinct('hallId');
    query._id = { $nin: occupiedHallIds };
    const availableHalls = await HallModel.find(query).lean();

    return availableHalls.map(doc => new Hall({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async save(hall) {
    const doc = await HallModel.create({
      name: hall.name,
      type: hall.type,
      capacity: hall.capacity,
      floor: hall.floor,
      building: hall.building,
      equipment: hall.equipment,
      status: hall.status
    });
    return new Hall({ id: doc._id.toString(), ...doc.toObject(), _id: undefined });
  }

  async update(id, data) {
    const doc = await HallModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!doc) return null;
    return new Hall({ id: doc._id.toString(), ...doc, _id: undefined });
  }

  async delete(id) {
    await HallModel.findByIdAndDelete(id);
  }
}

module.exports = MongooseHallRepository;
