class CreateHallUseCase {
  constructor({ hallRepository }) {
    this.hallRepository = hallRepository;
  }

  async execute(dto) {
    const Hall = require('../../../domain/entities/hallEntity');
    const hall = new Hall(dto);
    return this.hallRepository.save(hall);
  }
}

module.exports = CreateHallUseCase;
