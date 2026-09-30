// Runs before Jest spawns workers, so every test sees the same timezone no matter
// where it runs. Europe/London has DST, which the reminder planner tests rely on.
module.exports = async () => {
  process.env.TZ = 'Europe/London';
};
