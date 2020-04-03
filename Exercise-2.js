// REST handler
'use strict';

const cloneDeep = require("lodash.clonedeep"),
  globals = require("./TelosTouch/modules/globals"),
  persistence = require("./TelosTouch/modules/functions"),
  httpStatus = {
    NO_CONTENT: 204,
    INTERNAL_SERVER_ERROR: 500
  },
  postMessagesList = async (stepId, messages, res) => {
    let cache = {};
    if (messages) {
      try {
        const oldMessages = await persistence().findall(globals.modelNames.CommunicationMessage, { step_id: globals.generateUuidFromString(stepId) });
        await (() => {
          cache.oldMessages = cloneDeep(oldMessages);
          return persistence().del(globals.modelNames.CommunicationMessage, { findBy: { step_id: globals.generateUuidFromString(stepId) } });
        })();
        const savedNewMessages = await Promise.resolve(
          messages.reduce((promises, message) => [
            ...promises,
            persistence().save(globals.modelNames.CommunicationMessage, message)
          ], [])
        );
        await (() => {
          cache.newMessages = cloneDeep(savedNewMessages);
          let messageMap = new Map();
          cache.newMessages.forEach(message => messageMap.set(message.id, message));

          return Promise.resolve(
            cache.oldMessages.reduce((promises, message) =>
              !messageMap.has(message.id) ? [
                ...promises,
                persistence().del(globals.modelNames.CommunicationAction, { findBy: { message_id: message.id } })
              ] : promises, [])
          );
        })();
        await (() => {
          if (Array.isArray(cache.newMessages) && cache.newMessages.length) {
            res.send(cache.newMessages);
          } else {
            res.status(httpStatus.NO_CONTENT).send("No content");
          }

          return Promise.resolve(true);
        })();
      } catch (err) {
        console.error(err);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
        return Promise.resolve(false);
      }
    } else {
      res.status(httpStatus.NO_CONTENT).send("No content");
      return Promise.resolve(false);
    }
  },
  postMessagesHandler = (req, res) => {
    postMessagesList(req.body.stepId, req.body.messages, res);
  };

exports.postMessagesHandler = postMessagesHandler;
