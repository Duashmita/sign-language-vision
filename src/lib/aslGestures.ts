import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose';

// ASL Alphabet gesture definitions
// Each letter is defined by finger curl states and directions

export const aslGestures: GestureDescription[] = [];

// Letter A - Fist with thumb alongside
const aGesture = new GestureDescription('A');
aGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
aGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
aslGestures.push(aGesture);

// Letter B - Flat hand, fingers up, thumb across palm
const bGesture = new GestureDescription('B');
bGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
bGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
bGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
bGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
bGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
bGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.7);
aslGestures.push(bGesture);

// Letter C - Curved hand like holding a cup
const cGesture = new GestureDescription('C');
cGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.8);
cGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);
aslGestures.push(cGesture);

// Letter D - Index up, other fingers touch thumb
const dGesture = new GestureDescription('D');
dGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
dGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
dGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
dGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
dGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.7);
aslGestures.push(dGesture);

// Letter E - All fingers curled, thumb across
const eGesture = new GestureDescription('E');
eGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
eGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
aslGestures.push(eGesture);

// Letter F - OK sign, three fingers up
const fGesture = new GestureDescription('F');
fGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
fGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
aslGestures.push(fGesture);

// Letter G - Index and thumb pointing sideways
const gGesture = new GestureDescription('G');
gGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
gGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
gGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
gGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
gGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
gGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.7);
gGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 0.7);
aslGestures.push(gGesture);

// Letter I - Pinky up, others curled
const iGesture = new GestureDescription('I');
iGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
iGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
iGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.7);
aslGestures.push(iGesture);

// Letter K - Index and middle up in V, thumb between
const kGesture = new GestureDescription('K');
kGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.8);
kGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
kGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
kGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
kGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
aslGestures.push(kGesture);

// Letter L - L shape with thumb and index
const lGesture = new GestureDescription('L');
lGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
lGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
lGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
lGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
lGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
lGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.5);
lGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.5);
lGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.7);
aslGestures.push(lGesture);

// Letter O - All fingers curved to touch thumb
const oGesture = new GestureDescription('O');
oGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
oGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);
aslGestures.push(oGesture);

// Letter R - Index and middle crossed
const rGesture = new GestureDescription('R');
rGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
rGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
rGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
rGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
aslGestures.push(rGesture);

// Letter S - Fist with thumb over fingers
const sGesture = new GestureDescription('S');
sGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
sGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
aslGestures.push(sGesture);

// Letter U - Index and middle up together
const uGesture = new GestureDescription('U');
uGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
uGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
uGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
uGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
uGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
uGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.7);
uGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.7);
aslGestures.push(uGesture);

// Letter V - Peace sign
const vGesture = new GestureDescription('V');
vGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
vGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
vGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
vGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
vGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
aslGestures.push(vGesture);

// Letter W - Three fingers up
const wGesture = new GestureDescription('W');
wGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
wGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
wGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
wGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
wGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
aslGestures.push(wGesture);

// Letter Y - Thumb and pinky out (hang loose)
const yGesture = new GestureDescription('Y');
yGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
yGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
aslGestures.push(yGesture);

export default aslGestures;
