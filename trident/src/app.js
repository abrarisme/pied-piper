// @flow
import path from "path";
import grpc from "grpc";
import mongoose from "mongoose";
import logger from "./logger";
// $FlowFixMe
import { loadSync } from "protobufjs";

import { SERVICE_NAMES, SERVICE_PORTS } from "../common/config";
import { GAPFApplication } from "./model/gapfApplication";
import {
  createSubmitGAPFObject,
  invalidSubmitGAPFCallError,
  getSubmittedGAPF
} from "./gateway/submitGAPF";

// Load the service definition for the server from .proto files.
const PROTO_PATH = path.join(__dirname, "/../common/proto/trident.proto");
const { trident } = grpc.load(PROTO_PATH);

// Get all structures from .proto files.
const protoRoot = loadSync(PROTO_PATH);
const GAPF = protoRoot.lookupType("trident.GAPF");
const GAPFStatus = protoRoot.lookupEnum("trident.GAPFStatus");
const Document = protoRoot.lookupType("trident.Document");
const GAPFList = protoRoot.lookupType("trident.GAPFList");

type Status = "SUBMITTED" | "BUDGET_ALLOCATED";
type DocumentType = {
  name: string,
  link: string,
  attachedDate: number
};

type GAPFType = {
  facultyId: number,
  created: number,
  lastModified: number,
  status: Status,
  attachedDocuments: Array<DocumentType>
};

type CallbackType = {
  error: ?string,
  payload: ?GAPFType
};

// Make initial connection to Mongo Atlas on service startup
var mongoURI =
  `mongodb://admin:Y70TcYY3BVVKK7zp@cluster0-shard-00-00-sxvcc.mongodb.` +
  `net:27017,cluster0-shard-00-01-sxvcc.mongodb.net:27017,cluster0-shard` +
  `-00-02-sxvcc.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard` +
  `-0&authSource=admin`;
mongoose.connect(mongoURI);

/**
 * Call to Mongo client to store the given GAPF document and return the submitted document.
 *
 * @param gapfRequest the request message as specified by .proto files
 */
export const submitGAPFBackend = async (
  gapfRequest: GAPFType
): Promise<CallbackType> => {
  logger.info("Enter submitGAPFBackend with request body %j", gapfRequest);

  const { facultyId } = gapfRequest;
  if (facultyId === undefined) {
    logger.error("facultyId missing from request body: %j", gapfRequest);
    return invalidSubmitGAPFCallError;
  }

  const gapf = createSubmitGAPFObject(gapfRequest);
  logger.info("Request GAPF object: %j", gapf);

  try {
    const submittedForm = await GAPFApplication.submit(gapf);
    logger.info("DB response with data: %j", submittedForm);
    const submittedData = getSubmittedGAPF(submittedForm);

    const payload = GAPF.create(submittedData);
    logger.info("Response payload data: %j", payload);
    return { error: null, payload: payload };
  } catch (error) {
    logger.error("Error: %j", error.message);
    return { error: error, payload: null };
  }
};

/**
 * Retrieve the GAPF associated with a specific faculty member.
 *
 * @param faculty the Faculty to retrieve information for
 */
const retrieveGAPFInfo = faculty => ({
  facultyId: faculty.facultyId,
  budgetRequested: 0,
  active: true
});

/**
 * @returns all stored GAPF documents
 */
const getAllGAPFStatus = async empty => {
  const allGAPF = {
    applications: [
      {
        facultyId: 10,
        status: "SUBMITTED"
      }
    ]
  };
  const payload = GAPFList.create(allGAPF);
  return { error: null, payload: payload };
};

// gRPC doesn't allow using promises of async/await on the server-side, so callbacks are used
const submitGAPF = (call, callback) => {
  submitGAPFBackend(call.request).then(response => {
    callback(response.error, response.payload);
  });
};

const getGAPF = (call, callback) =>
  callback(null, retrieveGAPFInfo(call.request));

const getAllGAPF = (call, callback) => {
  getAllGAPFStatus(call.request).then(response => {
    callback(response.error, response.payload);
  });
};

/**
 * Get a new server with the handler functions in this file bound to the methods
 * it serves.
 * @return {Server} The new server object
 */
function getServer() {
  const server = new grpc.Server();
  server.addService(trident.Trident.service, {
    submitGapf: submitGAPF,
    getGapf: getGAPF,
    getAllGapf: getAllGAPF
  });
  return server;
}

if (require.main === module) {
  // If this is run as a script, start a server on an unused port
  const routeServer = getServer();
  const tridentPort = SERVICE_PORTS[SERVICE_NAMES.TRIDENT];
  routeServer.bind(
    `0.0.0.0:${tridentPort}`,
    grpc.ServerCredentials.createInsecure()
  );
  routeServer.start();
}

exports.getServer = getServer;
