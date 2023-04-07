import fileService from "./fileService";

export default class ServiceMessage {
  constructor(status, result, message) {
    this.status = status;
    this.result = result;
    this.message = message;
  }
}

module.exports = {
  fileService,
};
