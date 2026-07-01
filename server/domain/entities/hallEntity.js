class Hall {
  constructor({ id, name, type, capacity, floor, building, equipment, status }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.capacity = capacity;
    this.floor = floor;
    this.building = building;
    this.equipment = equipment || [];
    this.status = status || 'active';
  }

  isLab() {
    return this.type === 'lab';
  }

  isLectureHall() {
    return this.type === 'lecture';
  }

  isAvailable() {
    return this.status === 'active';
  }

  needsMaintenance() {
    return this.status === 'maintenance';
  }

  hasEquipment(name) {
    return this.equipment.some(e => e.name === name && e.condition === 'working');
  }
}

module.exports = Hall;
