import {
  GraphqlApi,
  Schema,
  AuthorizationType,
  MappingTemplate,
} from '@aws-cdk/aws-appsync';
import { Rule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Stack, App, StackProps, CfnOutput } from '@aws-cdk/core';
import path from 'path';

export class EventBridgeObserver extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, 'Api', {
      name: 'EventObserver',
      schema: Schema.fromAsset(path.join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.IAM,
          },
        ],
      },
    });

    const noneDS = api.addNoneDataSource('none');

    noneDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'sendEvent',
      requestMappingTemplate: MappingTemplate.fromString(`
      {
        "version": "2017-02-28",
        "payload": {}
      }
      `),
      responseMappingTemplate: MappingTemplate.fromString(
        '$util.toJson($context.args.event)',
      ),
    });

    const eventHandler = new NodejsFunction(this, 'eventHandler', {
      memorySize: 1024,
      runtime: Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: path.join(__dirname, `eventHandler/index.ts`),
      environment: {
        APPSYNC_ENDPOINT: api.graphqlUrl,
      },
    });

    api.grantMutation(eventHandler);

    const lambdaTarget = new LambdaFunction(eventHandler);

    new Rule(this, 'capture-events', {
      enabled: true,
      description: `forward to appsync`,
      ruleName: `toAppSync`,
      eventPattern: {
        version: ['0'],
      },
      targets: [lambdaTarget],
    });

    new CfnOutput(this, 'AppSyncEndpoint', {
      value: api.graphqlUrl,
    });
    new CfnOutput(this, 'AppSyncApiKey', {
      value: api.apiKey,
    });
  }
}
