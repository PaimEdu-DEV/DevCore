import sharp from 'sharp';
await sharp('art/world-v3/village-source.png').extract({left:172,top:0,width:1328,height:940}).resize(576,408,{kernel:'nearest'}).png().toFile('public/assets/world-v3/village.png');
