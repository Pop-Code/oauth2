import { FastifyInstance } from 'fastify';
import formAutoContent from 'form-auto-content';

import { createApplication } from '../exemple/app';
import { FastifyOAuth2 } from '../src/oauth2';

describe('oauth2-client-credentials-fastify', () => {
    let app: FastifyInstance;
    let oauth2: FastifyOAuth2;
    beforeAll(async () => {
        [app, oauth2] = await createApplication();
    });
    describe('Token', () => {
        describe('Error', () => {
            it('Should throw an invalid_request because grant_type is missing', async () => {
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token'
                });
                const body = response.json();
                expect(response.statusCode).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_request');
            });
            it('Should throw an invalid_request because request is not using application/x-www-form-urlencoded', async () => {
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token'
                });
                const body = response.json();
                const status = response.statusCode;
                expect(status).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_request');
                expect(body.error_description).toContain('application/x-www-form-urlencoded');
            });
            it('Should throw an invalid_request because client_secret is missing', async () => {
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    ...formAutoContent({
                        grant_type: 'client_credentials',
                        client_id: '1234'
                    })
                });
                const body = response.json();
                expect(response.statusCode).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_request');
            });
            it('Should throw an invalid_request because client_id is empty', async () => {
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    ...formAutoContent({
                        grant_type: 'client_credentials',
                        client_id: ''
                    })
                });
                const body = response.json();
                expect(response.statusCode).toBe(400);
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
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    ...formAutoContent({
                        grant_type: 'client_credentials',
                        client_id: 'test'
                    })
                });
                const body = response.json();
                expect(response.statusCode).toBe(400);
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
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    ...formAutoContent({
                        grant_type: 'fake'
                    })
                });
                const body = response.json();
                expect(response.statusCode).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('unsupported_grant_type');
            });
            it('Should throw an invalid_client because client credentials are missing', async () => {
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    ...formAutoContent({
                        grant_type: 'client_credentials'
                    })
                });
                const body = response.json();
                expect(response.statusCode).toBe(400);
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_client');
                expect(body.error_description).toBe('Invalid client credentials');
            });
            it('Should throw an invalid_client because client credentials are not valid', async () => {
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    ...formAutoContent({
                        grant_type: 'client_credentials',
                        client_id: 'test',
                        client_secret: 'badvalue'
                    })
                });
                const body = response.json();
                expect(response.statusCode).toBe(400);
                expect(response.headers['content-type']).toContain('application/json');
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_client');
                expect(body.error_description).toBe('Invalid client credentials');
            });
            it('Should throw an invalid_client because basic auth is malformed', async () => {
                const form = formAutoContent({
                    grant_type: 'client_credentials'
                });
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    headers: {
                        ...form.headers,
                        Authorization: 'fakeauth'
                    },
                    payload: form.payload
                });
                const body = response.json();
                expect(response.statusCode).toBe(400);
                expect(response.headers['content-type']).toContain('application/json');
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_request');
                expect(body.error_description).toBe('Basic authorization header is malformed');
            });
            it('Should throw an invalid_client because basic auth is not valid', async () => {
                const form = formAutoContent({
                    grant_type: 'client_credentials'
                });
                const badAuth = Buffer.from(
                    `${encodeURIComponent('test')}:${encodeURIComponent('fakeSecret')}`
                ).toString('base64');
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    headers: {
                        ...form.headers,
                        Authorization: `Basic ${badAuth}`
                    },
                    payload: form.payload
                });
                const body = response.json();
                expect(response.statusCode).toBe(400);
                expect(response.headers['content-type']).toContain('application/json');
                expect(body).toHaveProperty('error');
                expect(body).toHaveProperty('error_description');
                expect(body).toHaveProperty('statusCode');
                expect(body.error).toBe('invalid_client');
                expect(body.error_description).toBe('Invalid client credentials');
            });
        });
        describe('Response', () => {
            it('Should return an OAuth2ClientCredentialsTokenResponse without scope', async () => {
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    ...formAutoContent({
                        grant_type: 'client_credentials',
                        client_id: 'test',
                        client_secret: 'test'
                    })
                });
                const body = response.json();
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toContain('application/json');
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
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    ...formAutoContent({
                        grant_type: 'client_credentials',
                        client_id: 'test',
                        client_secret: 'test',
                        scope
                    })
                });
                const body = response.json();
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toContain('application/json');
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
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    ...formAutoContent({
                        grant_type: 'client_credentials',
                        client_id: 'test',
                        client_secret: 'test',
                        scope
                    })
                });
                const body = response.json();
                expect(response.statusCode).toBe(200);
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
                const form = formAutoContent({
                    grant_type: 'client_credentials'
                });
                const response = await app.inject({
                    method: 'POST',
                    url: '/oauth2/token',
                    headers: {
                        ...form.headers,
                        Authorization: `Basic ${auth}`
                    },
                    payload: form.payload
                });
                const body = response.json();
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toContain('application/json');
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
});
