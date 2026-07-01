const UserModel = require('../models/userModel');
const User = require('../../../domain/entities/userEntity');

class MongooseUserRepository {
  async findById(id) {
    const doc = await UserModel.findById(id).lean();
    if (!doc) return null;
    return new User({ id: doc._id.toString(), ...doc, _id: undefined });
  }

  async findByEmail(email) {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!doc) return null;
    return new User({ id: doc._id.toString(), ...doc, _id: undefined });
  }

  async findAll(filter = {}) {
    const docs = await UserModel.find(filter).lean();
    return docs.map(doc => new User({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async findAllPaginated(filter = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      UserModel.find(filter).skip(skip).limit(limit).lean(),
      UserModel.countDocuments(filter)
    ]);
    return {
      data: docs.map(doc => new User({ id: doc._id.toString(), ...doc, _id: undefined })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async save(user) {
    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      department: user.department,
      phone: user.phone,
      isActive: user.isActive,
      ...(user.googleId && { googleId: user.googleId }),
      ...(user.picture  && { picture:  user.picture  }),
    });
    return new User({ id: doc._id.toString(), ...doc.toObject(), _id: undefined });
  }

  async update(id, data) {
    const doc = await UserModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!doc) return null;
    return new User({ id: doc._id.toString(), ...doc, _id: undefined });
  }

  async delete(id) {
    await UserModel.findByIdAndDelete(id);
  }
}

module.exports = MongooseUserRepository;
