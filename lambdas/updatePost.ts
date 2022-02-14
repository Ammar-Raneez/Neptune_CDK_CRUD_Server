import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { driver, process as gremlinProcess, structure } from 'gremlin';

const { cardinality: { single } } = gremlinProcess;

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

  let post;
  if (event.body) {
    post = JSON.parse(event.body);
  }

  const driverConnector = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
  const graph = new Graph();
  const g = graph.traversal().withRemote(driverConnector);

  try {
    if (post.title && post.content) {
      await g.V(postId).property(single, 'title', post.title).property(single, 'content', post.content).next();
    } else if (post.title) {
      await g.V(postId).property(single, 'title', post.title).next();
    } else {
      await g.V(postId).property(single, 'content', post.content).next();
    }

    const properties = await g.V(postId).properties().toList();
    const updatedPost = properties.reduce((acc: any, next: any) => {
      acc[next.label] = next.value;
      return acc;
    }, {});

    updatedPost.id = postId;
    driverConnector.close();
    result.body = JSON.stringify(updatedPost);
  } catch (err) {
    console.log('ERROR', err);
    result.body = (err as any).message;
  }

  return result;
}

export default handler;
