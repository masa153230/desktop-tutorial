import numpy as np, subprocess, sys, math
fps=int(sys.argv[1]); slow=float(sys.argv[2]); out=sys.argv[3]; W,H=int(sys.argv[4]),int(sys.argv[5])
# real-time timeline (s): waggle 0.2-0.4, address still to 0.8, BS 0.8-1.55, top pause to 1.58, DS to 1.83, FT to 2.3, still to 3.0
def theta(t):
    if 0.2<t<0.4: return 15*math.sin((t-0.2)/0.2*math.pi)
    if t<0.8: return 0
    if t<1.55: u=(t-0.8)/0.75; return 260*(0.5-0.5*math.cos(math.pi*u))
    if t<1.58: return 260
    if t<1.83: u=(t-1.58)/0.25; return 260+100*u*u
    if t<2.3: u=(t-1.83)/0.47; return 360+180*(2*u-u*u)
    return 540
yy,xx=np.mgrid[0:H,0:W]
bg=(np.stack([60+xx*0.2,120+yy*0.1,60+0*xx],-1)).astype(np.float32)
rng=np.random.default_rng(1)
codec=["-c:v","libx264","-pix_fmt","yuv420p","-crf","28","-movflags","+faststart"] if out.endswith(".mp4") else ["-c:v","libvpx-vp9","-b:v","300k"]
p=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(fps),'-i','-',*codec,out],stdin=subprocess.PIPE)
n=int(3.0*slow*fps)
for i in range(n):
    t=i/fps/slow; f=bg.copy()
    f[int(H*200/640):int(H*420/640),int(W*150/360):int(W*210/360)]=[200,180,150]  # body
    th=math.radians(theta(t)); px,py=W//2,int(H*380/640)
    for r in range(0,int(H*170/640),1):
        x=int(px+r*math.sin(th)); y=int(py+r*math.cos(th))
        if 0<=x<W-4 and 0<=y<H-4: f[y:y+3,x:x+3]=[240,240,240]
    f+=rng.normal(0,2,f.shape)
    p.stdin.write(np.clip(f,0,255).astype(np.uint8).tobytes())
p.stdin.close();p.wait()
