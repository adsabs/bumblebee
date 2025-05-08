import * as Yup from "yup";
import { MissingIncorrectRecordFormValues, BibcodeItem } from "../models";

// define and cast the item schema
const bibcodeItemSchema: Yup.ObjectSchema<BibcodeItem> = Yup.object({
  citing: Yup.string()
    .trim()
    .length(19, "Citing bibcode must be 19 characters")
    .required("Citing bibcode is required"),

  cited: Yup.string()
    .trim()
    .length(19, "Cited bibcode must be 19 characters")
    .required("Cited bibcode is required")
    .test(
      "citing-and-cited-not-equal",
      "Cited bibcode must be different from citing",
      function (value) {
        return value !== this.parent.citing;
      }
    )
});

// ✅ cast the whole array schema
const bibcodesSchema = Yup.array(bibcodeItemSchema)
  .min(1, "At least one bibcode pair is required")
  .required("Bibcode list is required") as Yup.ArraySchema<BibcodeItem>;

export const validationSchema: Yup.ObjectSchema<MissingIncorrectRecordFormValues> = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  bibcodes: bibcodesSchema,
  recaptcha: Yup.string().ensure()
});
