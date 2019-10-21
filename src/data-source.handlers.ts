import { RequestHandler } from 'express';
import omit from 'lodash/omit';

import { DataSourceDocument, DataSourceModel } from './data-source.model';
import { NotFoundHttpError } from './lib/http-error';
import { elseThrow } from './lib/else-throw';
import { publishDataSource } from './rabbitmq/rabbitmq';

interface ResourceHandlerMap {
  create: RequestHandler;
  getById: RequestHandler;
  getAll: RequestHandler;
  update: RequestHandler;
  deleteById: RequestHandler;
  harvestById: RequestHandler;
}

export default {
  create: (req, res, next): void => {
    const data = omit(req.body, 'id');
    new DataSourceModel(data)
      .save()
      .then(doc => {
        res
          .location(doc.id)
          .status(201)
          .send();

        publishDataSource(doc);
      })
      .catch(next);
  },

  update: (req, res, next): void => {
    const { id } = req.params;
    const data = omit(req.body, 'id');
    DataSourceModel.findOneAndUpdate({ id }, data, { new: true })
      .then(elseThrow<DataSourceDocument>(() => new NotFoundHttpError()))
      .then(doc => {
        res.status(200).send(doc.toObject());
        publishDataSource(doc);
      })
      .catch(next);
  },

  getById: (req, res, next): void => {
    const { id } = req.params;
    DataSourceModel.findOne({ id })
      .then(elseThrow<DataSourceDocument>(() => new NotFoundHttpError()))
      .then(doc => res.status(200).send(doc.toObject()))
      .catch(next);
  },

  getAll: (req, res, next): void => {
    DataSourceModel.find(req.query)
      .then(docs => res.send(docs.map(doc => doc.toObject())))
      .catch(next);
  },

  deleteById: (req, res, next): void => {
    const { id } = req.params;
    DataSourceModel.deleteOne({ id })
      .then(() => res.status(204).send())
      .catch(next);
  },

  harvestById: (req, res, next): void => {
    const { id } = req.params;
    DataSourceModel.findOne({ id })
      .then(elseThrow<DataSourceDocument>(() => new NotFoundHttpError()))
      .then(doc => {
        res.status(204).send();
        publishDataSource(doc);
      })
      .catch(next);
  }
} as ResourceHandlerMap;
