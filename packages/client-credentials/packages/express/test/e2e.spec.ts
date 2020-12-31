import { OAuth2Client, OAuth2Token } from '@pop-code/oauth2-common';
import { Application } from 'express';
import request from 'supertest';

import { createApplication } from '../exemple/app';
import { ExpressOAuth2 } from '../src/oauth2';

describe('oauth2-client-credentials-express', () => {
    let app: Application;
    let oauth2: ExpressOAuth2<OAuth2Client, OAuth2Token>;
    beforeAll(async () => {
        [app, oauth2] = await createApplication();
    });
    describe('Token', () => {
        describe('Error', () => {
            it('Should throw an invalid_request because grant_type is missing', async () => {
                const { status, body } = await request(app).post('/oauth2/token').type('form');
                expect(status).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_request');
            });
            it('Should throw an invalid_request because request is not using application/x-www-form-urlencoded', async () => {
                const { status, body } = await request(app).post('/oauth2/token').send({
                    grant_type: 'client_credentials'
                });
                expect(status).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_request');
                expect(body.error_description).toContain('application/x-www-form-urlencoded');
            });
            it('Should throw an invalid_request because client_secret is missing', async () => {
                const { status, body } = await request(app).post('/oauth2/token').type('form').send({
                    grant_type: 'client_credentials',
                    client_id: '1234'
                });
                expect(status).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_request');
            });
            it('Should throw an invalid_request because client_id is empty', async () => {
                const { status, body } = await request(app).post('/oauth2/token').type('form').send({
                    grant_type: 'client_credentials',
                    client_id: ''
                });
                expect(status).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('statusCode');
                expect(body).toHaveProperty('validationErrors');
                expect(body.error).toBe('invalid_request');
                expect(body.validationErrors).toHaveLength(1);
                expect(body.validationErrors[0]).toHaveProperty('property');
                expect(body.validationErrors[0].property).toBe('client_id');
                expect(body.validationErrors[0].constraints).toHaveProperty('minLength');
            });
            it('Should throw an invalid_request because client_secret is empty', async () => {
                const { status, body } = await request(app).post('/oauth2/token').type('form').send({
                    grant_type: 'client_credentials',
                    client_id: 'test'
                });
                expect(status).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('statusCode');
                expect(body).toHaveProperty('validationErrors');
                expect(body.error).toBe('invalid_request');

                expect(body.validationErrors).toHaveLength(1);
                expect(body.validationErrors[0]).toHaveProperty('property');
                expect(body.validationErrors[0].property).toBe('client_secret');
                expect(body.validationErrors[0].constraints).toHaveProperty('minLength');
            });
            it('Should throw an unsupported_grant_type because grant_type is not supported', async () => {
                const { status, body } = await request(app).post('/oauth2/token').type('form').send({
                    grant_type: 'dummygrant'
                });
                expect(status).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('unsupported_grant_type');
            });
            it('Should throw an invalid_client because client credentials are missing', async () => {
                const { status, body } = await request(app).post('/oauth2/token').type('form').send({
                    grant_type: 'client_credentials'
                });
                expect(status).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_client');
                expect(body.error_description).toBe('Invalid client credentials');
            });
            it('Should throw an invalid_client because client credentials are not valid', async () => {
                const { status, body, headers } = await request(app).post('/oauth2/token').type('form').send({
                    grant_type: 'client_credentials',
                    client_id: 'test',
                    client_secret: 'badvalue'
                });
                expect(status).toBe(400);
                expect(headers['content-type']).toContain('application/json');
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_client');
                expect(body.error_description).toBe('Invalid client credentials');
            });
            it('Should throw an invalid_client because basic auth is malformed', async () => {
                const { status, body, headers } = await request(app)
                    .post('/oauth2/token')
                    .set('Authorization', `fakeauth`)
                    .type('form')
                    .send({
                        grant_type: 'client_credentials'
                    });
                expect(status).toBe(400);
                expect(headers['content-type']).toContain('application/json');
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_request');
                expect(body.error_description).toBe('Basic authorization header is malformed');
            });
            it('Should throw an invalid_client because basic auth is not valid', async () => {
                const badAuth = Buffer.from(
                    `${encodeURIComponent('test')}:${encodeURIComponent('fakeSecret')}`
                ).toString('base64');
                const { status, body, headers } = await request(app)
                    .post('/oauth2/token')
                    .set('Authorization', `Basic ${badAuth}`)
                    .type('form')
                    .send({
                        grant_type: 'client_credentials'
                    });
                expect(status).toBe(400);
                expect(headers['content-type']).toContain('application/json');
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_client');
                expect(body.error_description).toBe('Invalid client credentials');
            });
        });
        describe('Response', () => {
            it('Should return an OAuth2ClientCredentialsTokenResponse without scope', async () => {
                const { status, body, headers } = await request(app).post('/oauth2/token').type('form').send({
                    grant_type: 'client_credentials',
                    client_id: 'test',
                    client_secret: 'test'
                });
                expect(status).toBe(200);
                expect(headers['content-type']).toContain('application/json');
                expect(typeof body.access_token).toBe('string');
                expect(body.access_token.length).toBeGreaterThan(1);
                expect(body.expires_in).toBeDefined();
                expect(typeof body.expires_in).toBe('number');
                expect(body.token_type).toBeDefined();
                expect(typeof body.token_type).toBe('string');
                expect(body.token_type).toBe('bearer');
                expect(body.scope).not.toBeDefined();
            });

            it('Should return an OAuth2ClientCredentialsTokenResponse with complete scope', async () => {
                const scope = 'scope1 scope2';
                const { status, body, headers } = await request(app).post('/oauth2/token').type('form').send({
                    grant_type: 'client_credentials',
                    client_id: 'test',
                    client_secret: 'test',
                    scope
                });
                expect(status).toBe(200);
                expect(headers['content-type']).toContain('application/json');
                expect(typeof body.access_token).toBe('string');
                expect(body.access_token.length).toBeGreaterThan(1);
                expect(body.expires_in).toBeDefined();
                expect(typeof body.expires_in).toBe('number');
                expect(body.token_type).toBeDefined();
                expect(typeof body.token_type).toBe('string');
                expect(body.token_type).toBe('bearer');
                expect(body.scope).toBeDefined();
                expect(body.scope).toBe(scope);
            });

            it('Should return an OAuth2ClientCredentialsTokenResponse with partial scope', async () => {
                const scope = 'scope1 scope2 fakescope';
                const { status, body } = await request(app).post('/oauth2/token').type('form').send({
                    grant_type: 'client_credentials',
                    client_id: 'test',
                    client_secret: 'test',
                    scope
                });
                expect(status).toBe(200);
                expect(typeof body.access_token).toBe('string');
                expect(body.access_token.length).toBeGreaterThan(1);
                expect(body.expires_in).toBeDefined();
                expect(typeof body.expires_in).toBe('number');
                expect(body.token_type).toBeDefined();
                expect(typeof body.token_type).toBe('string');
                expect(body.token_type).toBe('bearer');
                expect(body.scope).toBeDefined();
                expect(body.scope).toBe('scope1 scope2');
            });

            it('Should return an OAuth2ClientCredentialsTokenResponse using basic auth', async () => {
                const auth = Buffer.from(`${encodeURIComponent('test')}:${encodeURIComponent('test')}`).toString(
                    'base64'
                );
                const { status, body, headers } = await request(app)
                    .post('/oauth2/token')
                    .set('Authorization', `Basic ${auth}`)
                    .type('form')
                    .send({
                        grant_type: 'client_credentials'
                    });
                expect(status).toBe(200);
                expect(headers['content-type']).toContain('application/json');
                expect(typeof body.access_token).toBe('string');
                expect(body.access_token.length).toBeGreaterThan(1);
                expect(body.expires_in).toBeDefined();
                expect(typeof body.expires_in).toBe('number');
                expect(body.token_type).toBeDefined();
                expect(typeof body.token_type).toBe('string');
                expect(body.token_type).toBe('bearer');
                expect(body.scope).not.toBeDefined();
                expect(oauth2.tokenProvider.findOneByAcessToken(body.access_token)).toBeDefined();
            });
        });
    });
    describe('Authenticate', () => {
        describe('Error', () => {
            it('Should throw an error cause because grant_type is missing', async () => {
                const { status, body } = await request(app).post('/oauth2/token').type('form');
                expect(status).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_request');
            });
        });
    });
});
