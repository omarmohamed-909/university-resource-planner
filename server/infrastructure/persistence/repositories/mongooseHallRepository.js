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

  async findAllPaginated(filter = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      HallModel.find(filter).skip(skip).limit(limit).lean(),
      HallModel.countDocuments(filter)
    ]);
    return {
      data: docs.map(doc => new Hall({ id: doc._id.toString(), ...doc, _id: undefined })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async findAvailable({ day, startTime, endTime, semester, excludeScheduleId } = {}) {
    const ScheduleModel = require('../models/scheduleModel');
    const query = { status: 'active' };
    const halls = await HallModel.find(query).lean();

    if (!day || !startTime || !endTime) {
      return halls.map(doc => new Hall({ id: doc._id.toString(), ...doc, _id: undefined }));
    }

    const scheduleQuery = { day, semester };
    if (excludeScheduleId) {
      scheduleQuery._id = { $ne: excludeScheduleId };
    }
    const schedules = await ScheduleModel.find(scheduleQuery).lean();

    const availableHalls = halls.filter(hall => {
      const hallSchedules = schedules.filter(s => s.hallId.toString() === hall._id.toString());
      return !hallSchedules.some(s => {
        return startTime < s.endTime && endTime > s.startTime;
      });
    });

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
