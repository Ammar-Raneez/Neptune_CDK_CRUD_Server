import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { driver, structure } from 'gremlin';

const DriverRemoteConnection = driver.DriverRemoteConnection;
const Graph = structure.Graph;
const uri = process.env.WRITER;

async function handler(event: APIGatewayProxyEvent, context: Context) {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: '',
  };

  let postId;
  if (event.pathParameters) {
    postId = event.pathParameters.postId;
  }

  const driverConnector = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
  const graph = new Graph();
  const g = graph.traversal().withRemote(driverConnector);

  try {
    await g.V(postId).drop().iterate();
    driverConnector.close();
    result.body = JSON.stringify(postId);
  } catch (err) {
    console.log('ERROR', err);
    result.body = (err as any).message;
  }

  return result;
}

export { handler };
