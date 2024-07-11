import mongoose, { Document, Model, Schema } from "mongoose";
import bcypt from "bcryptjs";

const emailRegexPattern: RegExp =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "pleace enter your name"],
    },
    email: {
      type: String,
      required: [true, "pleace enter your email"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "please enter valid password",
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, "pleace enter your password"],
      minlength: [6, "password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      defalut: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    next();
  }
  this.password = await bcypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (
  enterPassword: string
): Promise<boolean> {
  return await bcypt.compare(enterPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model("user", userSchema);

export default userModel;
