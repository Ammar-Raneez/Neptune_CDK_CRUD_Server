import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { driver, structure } from 'gremlin';

const DriverRemoteConnection = driver.DriverRemoteConnection;
const Graph = structure.Graph;
const uri = process.env.READER;

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
    const properties = await g.V(postId).properties().toList();
    const post = properties.reduce((acc: any, next: any) => {
      acc[next.label] = next.value;
      return acc;
    }, {});

    post.id = postId;
    return post;
  } catch (err) {
    console.log('ERROR', err);
    result.body = (err as any).message;
  }
}


export default handler;
