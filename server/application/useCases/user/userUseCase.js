class UserUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async list({ role, search, page, limit }) {
    const filter = {};
    if (role) filter.role = role;
    return this.userRepository.findAllPaginated(filter, page, limit, search);
  }

  async getById(id) {
    return this.userRepository.findById(id);
  }

  async delete(id) {
    await this.userRepository.delete(id);
    return { deleted: true };
  }

  async update(id, data) {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new Error('User not found');
    
    if (data.password) {
      const bcrypt = require('bcryptjs');
      data.password = await bcrypt.hash(data.password, 12);
    }
    
    return this.userRepository.update(id, data);
  }
}

module.exports = UserUseCase;
