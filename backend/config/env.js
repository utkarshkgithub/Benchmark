// Only load dotenv in local development, not in Lambda
if (!process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.LAMBDA_TASK_ROOT) {
  const dotenv = await import('dotenv');
  dotenv.config();
}