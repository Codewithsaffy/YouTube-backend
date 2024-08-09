// this method will use in to response like success and failed

// in promises

const asyncHandler = (func: any) => {
  (res: any, req: any, next: any) => {
    Promise.resolve(func(res, req, next)).catch((err) => {
      next(err);
    });
  };
};

// try catch

// const asyncHandler = (fn: any) => {
//   async (res: any, req: any, next: any) => {
//     try {
//       await fn(res, req, next);
//     } catch (error: any) {
//       res.status(error.code || 500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   };
// };
