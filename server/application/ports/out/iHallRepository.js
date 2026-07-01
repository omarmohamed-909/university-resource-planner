class IHallRepository {
  async findById(id) { throw new Error('Not implemented'); }
  async findAll(filter) { throw new Error('Not implemented'); }
  async findAvailable(filter) { throw new Error('Not implemented'); }
  async save(hall) { throw new Error('Not implemented'); }
  async update(id, data) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}
module.exports = IHallRepository;
