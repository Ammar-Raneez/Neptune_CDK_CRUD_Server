import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { driver, structure } from 'gremlin';

import { Post } from './Post';

const DriverRemoteConnection = driver.DriverRemoteConnection;
const Graph = structure.Graph;
const uri = process.env.WRITER;

async function handler(event: APIGatewayProxyEvent, context: Context) {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: '',
  };

  let post;
  if (event.body) {
    post = JSON.parse(event.body) as Post;
  }

  const driverConnector = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
  const graph = new Graph();
  const g = graph.traversal().withRemote(driverConnector);

  try {
    if (post) {
      const data = await g.addV('Posts')
        .property('title', post.title)
        .property('content', post.content)
        .next();

      post.id = data.value.id;
    }

    driverConnector.close();
    result.body = JSON.stringify(`${post ? 'Created item with id: ' + post.id : ''}`);
  } catch (err) {
    console.log('ERROR', err);
    result.body = (err as any).message;
  }

  return result;
}

export { handler };
