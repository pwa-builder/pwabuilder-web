import { FastifyInstance } from 'fastify';
import multipart from 'fastify-multipart';

export default function plugins(server: FastifyInstance): FastifyInstance {
  server.register(multipart);
  return server;
}
