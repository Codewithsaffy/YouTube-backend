class ApiResponseType {
  errorCode: number = 200;
  message: string = "success";
  data: any;
  success: boolean  = true;
}

class ApiResponse extends ApiResponseType {
  constructor(errorCode: number, message = "success", data: any) {
    super();
    this.errorCode = errorCode;
    this.message = message;
    this.data = data;
    this.success = errorCode < 400;
  }
}

export { ApiResponse }