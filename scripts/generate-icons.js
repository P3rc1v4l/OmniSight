const path=require('path'),fs=require('fs');
async function run(){
  try{
    const sharp=require('sharp'),pngToIco=require('png-to-ico');
    const src=path.join(__dirname,'..','src','assets','icon.png');
    const out=path.join(__dirname,'..','src','assets','icon.ico');
    const sizes=[16,32,48,64,128,256];
    const bufs=await Promise.all(sizes.map(s=>sharp(src).resize(s,s,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer()));
    const ico=await pngToIco(bufs);
    fs.writeFileSync(out,ico);
    console.log('icon.ico erstellt (transparent)');
  }catch(e){
    if(e.code==='MODULE_NOT_FOUND'){require('child_process').execSync('npm install sharp png-to-ico --save-dev',{stdio:'inherit',cwd:path.join(__dirname,'..')});console.log('Nochmal ausführen');}
    else console.error(e.message);
  }
}
run();
