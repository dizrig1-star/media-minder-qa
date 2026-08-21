import assert from "assert";
import {createFeedback,applyFeedback} from "../src/services/feedbackService.js";

const yes=createFeedback({itemId:"pelican-brief",value:"yes",note:"Good fit",surface:"recommendation",profileId:"test-01"});
assert.equal(yes.value,"yes");
assert.equal(yes.note,"Good fit");
assert.equal(applyFeedback({feedback:[]},yes).feedback.length,1);
const no=createFeedback({itemId:"x",value:"no"});
assert.equal(no.note,"");
assert.throws(()=>createFeedback({itemId:"x",value:"maybe"}));
assert.throws(()=>createFeedback({value:"yes"}));
console.log("PASS — User Feedback v1.1");
