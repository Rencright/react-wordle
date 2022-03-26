import { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    console.log(event.body);
    return {
      statusCode: 201,
      body: event.body,
    };
  } else {
    return {
      statusCode: 405,
    };
  }
};

export { handler };
