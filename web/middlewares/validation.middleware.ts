import { Request, Response, NextFunction } from "express";
import Joi from "joi";

// Type for validation options
interface ValidationOptions {
  abortEarly: boolean;
  allowUnknown: boolean;
  stripUnknown: boolean;
}

// Type for error response
interface ErrorResponse {
  success: boolean;
  message: string | string[];
  errors?: string[];
}

// Type guard to check if error is a Joi validation error
function isJoiError(error: any): error is Joi.ValidationError {
  return error.isJoi === true;
}

function validationMiddleware(schema: Joi.ObjectSchema) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const validationOptions: ValidationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    try {
      const value = await schema.validateAsync(req.body, validationOptions);
      req.body = value;
      next();
    } catch (e) {
      const errors: string[] = [];

      if (isJoiError(e)) {
        e.details.forEach((error) => {
          errors.push(error.message);
        });
      }

      res.status(400).json({
        success: false,
        message: errors.length > 0 ? errors : "Internal Server Error",
      } as ErrorResponse);
    }
  };
}

export function validateLayoutMiddleware(
  schemeGenerator: (handle: string) => Joi.ObjectSchema
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { handle } = req.body.layout;
      const schema = schemeGenerator(handle);

      const validationOptions: ValidationOptions = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      };

      const validatedBody = await schema.validateAsync(
        req.body,
        validationOptions
      );
      req.body = validatedBody;
      next();
    } catch (e) {
      if (isJoiError(e)) {
        const errors = e.details.map((error) => error.message);
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors,
        } as ErrorResponse);
        return;
      }

      const error = e as Error;
      res.status(400).json({
        success: false,
        message: error.message || "An error occurred during validation.",
      } as ErrorResponse);
    }
  };
}

export function validateRouteParameter(schema: Joi.ObjectSchema) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const validationOptions: ValidationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    try {
      const value = await schema.validateAsync(req.params, validationOptions);
      req.params = value;
      next();
    } catch (e) {
      const errors: string[] = [];

      if (isJoiError(e)) {
        e.details.forEach((error) => {
          errors.push(error.message);
        });
      }

      res.status(400).json({
        success: false,
        message: errors.length > 0 ? errors : "Request validation Error",
      } as ErrorResponse);
    }
  };
}

export function validateQueryParameter(schema: Joi.ObjectSchema) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const validationOptions: ValidationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    try {
      const value = await schema.validateAsync(req.query, validationOptions);
      req.query = value;
      next();
    } catch (e) {
      const errors: string[] = [];

      if (isJoiError(e)) {
        e.details.forEach((error) => {
          errors.push(error.message);
        });
      }

      res.status(400).json({
        success: false,
        message: errors.length > 0 ? errors : "Request validation Error",
      } as ErrorResponse);
    }
  };
}

export default validationMiddleware;
