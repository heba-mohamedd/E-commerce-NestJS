import { JwtPayload } from 'jsonwebtoken';
import { HUserDocument } from 'src/DB/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: HUserDocument;
      decoded?: JwtPayload;
    }
  }
}
