import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { driver, structure } from 'gremlin';

const DriverRemoteConnection = driver.DriverRemoteConnection;
const Graph = structure.Graph;
const uri = process.env.READER;

const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: '',
  };

  const driverConnector = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
  const graph = new Graph();
  const g = graph.traversal().withRemote(driverConnector);

  try {
    const data = await g.V().hasLabel('Posts').toList();
    const posts: any = [];

    for (const vertex of data) {
      const properties = await g.V(vertex).properties().toList();
      const post = properties.reduce((acc: any, next: any) => {
        acc[next.label] = next.value;
        return acc;
      }, {});

      post.id = (vertex as any).id;
      posts.push(post);
    }

    driverConnector.close();
    result.body = JSON.stringify(posts);
  } catch (err) {
    console.log('ERROR', err);
    result.body = (err as any).message;
  }

  return result;
}

export { handler };
