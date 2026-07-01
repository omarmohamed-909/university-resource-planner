const { createContainer, asClass, asValue, asFunction } = require('awilix');

const container = createContainer();

function registerDependencies() {
  const fs = require('fs');
  const path = require('path');

  const registerPath = (basePath, transform = asClass) => {
    const absolute = path.join(__dirname, '..', basePath);
    if (!fs.existsSync(absolute)) return;
    const entries = fs.readdirSync(absolute, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subPath = path.join(absolute, entry.name);
        const subEntries = fs.readdirSync(subPath);
        for (const file of subEntries) {
          if (file.endsWith('.js') && file !== 'index.js') {
            const name = path.basename(file, '.js');
            const Module = require(path.join(subPath, file));
            container.register(name, transform(Module).singleton());
          }
        }
      } else if (entry.name.endsWith('.js') && entry.name !== 'index.js') {
        const name = path.basename(entry.name, '.js');
        const Module = require(path.join(absolute, entry.name));
        container.register(name, transform(Module).singleton());
      }
    }
  };

  registerPath('domain/services');
  registerPath('application/useCases', asClass);
  registerPath('infrastructure/persistence/repositories', asClass);
  registerPath('infrastructure/auth', asClass);
  registerPath('infrastructure/qr', asClass);
  registerPath('infrastructure/socket', asClass);
  registerPath('infrastructure/email', asClass);
  registerPath('infrastructure/export', asClass);
  registerPath('interfaces/controllers', asClass);

  // Create aliases for repository interfaces
  const repoAliases = [
    ['mongooseUserRepository', 'userRepository'],
    ['mongooseHallRepository', 'hallRepository'],
    ['mongooseCourseRepository', 'courseRepository'],
    ['mongooseScheduleRepository', 'scheduleRepository'],
    ['mongooseAttendanceRepository', 'attendanceRepository'],
    ['mongooseSwapRepository', 'swapRepository']
  ];
  for (const [impl, alias] of repoAliases) {
    if (container.hasRegistration(impl)) {
      container.register(alias, asValue(container.resolve(impl)));
    }
  }

  // Alias auth service
  if (container.hasRegistration('jwtAuthService')) {
    container.register('authService', asValue(container.resolve('jwtAuthService')));
  }

  // Register middleware separately - they are functions, not classes
  const middlewarePath = path.join(__dirname, '..', 'interfaces', 'middleware');
  if (fs.existsSync(middlewarePath)) {
    const entries = fs.readdirSync(middlewarePath);
    for (const file of entries) {
      if (file.endsWith('.js')) {
        const name = path.basename(file, '.js');
        const fn = require(path.join(middlewarePath, file));
        container.register(name, asValue(fn));
      }
    }
  }
}

module.exports = { container, registerDependencies };
