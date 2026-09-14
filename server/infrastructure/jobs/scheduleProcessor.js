let ready;

async function bootstrap() {
  if (!ready) {
    ready = (async () => {
      require('dotenv').config();
      const { connectDatabase } = require('../../config/database');
      const { container, registerDependencies } = require('../../config/container');
      await connectDatabase();
      registerDependencies();
      return container.resolve('autoGenerateScheduleUseCase');
    })();
  }
  return ready;
}

module.exports = async job => {
  await job.updateProgress({ stage: 'loading', percent: 5 });
  const useCase = await bootstrap();
  await job.updateProgress({ stage: 'optimizing', percent: 15 });
  const result = await useCase.execute(job.data);
  await job.updateProgress({ stage: 'done', percent: 100 });
  return result;
};
