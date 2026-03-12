from flask import Flask, send_from_directory
import os

app = Flask(__name__)

@app.route('/img/<path:filename>')
def imagens(filename):
    return send_from_directory(os.getcwd(), filename)

@app.route("/")
def home():
    return """

<!DOCTYPE html>
<html>

<head>

<title>Carta para você ❤️</title>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<style>

body{
margin:0;
font-family:Arial;
text-align:center;
color:white;
overflow-x:hidden;
}

#bg{
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
z-index:-1;
}

.envelope{
margin-top:20vh;
font-size:90px;
cursor:pointer;
animation:pulse 1.5s infinite;
}

@keyframes pulse{
0%{transform:scale(1)}
50%{transform:scale(1.1)}
100%{transform:scale(1)}
}

.carta{
display:none;
background:rgba(255,255,255,0.95);
color:#333;
padding:40px;
border-radius:20px;
max-width:700px;
margin:auto;
margin-top:40px;
box-shadow:0 20px 40px rgba(0,0,0,0.4);
}

.slide{
opacity:0;
transform:translateX(50px);
position:absolute;
width:100%;
transition:all 0.8s;
font-size:22px;
}

.slide.ativo{
opacity:1;
transform:translateX(0);
position:relative;
}

.carousel{
margin-top:40px;
position:relative;
width:260px;
height:200px;
margin-left:auto;
margin-right:auto;
}

.slideFoto{
position:absolute;
width:100%;
opacity:0;
transform:scale(1.1);
transition:all 1s;
}

.slideFoto.ativa{
opacity:1;
transform:scale(1);
}

.slideFoto img{
width:100%;
border-radius:15px;
box-shadow:0 10px 20px rgba(0,0,0,0.4);
}

.legenda{
position:absolute;
bottom:10px;
left:50%;
transform:translateX(-50%);
background:rgba(0,0,0,0.6);
padding:5px 12px;
border-radius:10px;
font-size:14px;
color:white;
}

</style>

<script>

let slideAtual=0
let fotoAtual=0

function abrirCarta(){

document.getElementById("envelope").style.display="none"
document.getElementById("carta").style.display="block"

mostrarSlide()
mostrarFotos()

setInterval(proximoSlide,4000)
setInterval(proximaFoto,4500)

}

function mostrarSlide(){

let slides=document.getElementsByClassName("slide")

for(let i=0;i<slides.length;i++){
slides[i].classList.remove("ativo")
}

slides[slideAtual].classList.add("ativo")

}

function proximoSlide(){

let slides=document.getElementsByClassName("slide")

slideAtual++

if(slideAtual>=slides.length){
slideAtual=0
}

mostrarSlide()

}

function mostrarFotos(){

let fotos=document.getElementsByClassName("slideFoto")

for(let i=0;i<fotos.length;i++){
fotos[i].classList.remove("ativa")
}

fotos[fotoAtual].classList.add("ativa")

}

function proximaFoto(){

let fotos=document.getElementsByClassName("slideFoto")

fotoAtual++

if(fotoAtual>=fotos.length){
fotoAtual=0
}

mostrarFotos()

}

</script>

</head>

<body>

<canvas id="bg"></canvas>

<div id="envelope" class="envelope" onclick="abrirCarta()">
💌
<p>Clique para abrir</p>
</div>

<div id="carta" class="carta">

<h1>Feliz aniversário minha estrela ❤️</h1>

<div class="slide">Costelinha, hoje é o seu dia.</div>
<div class="slide">Algumas pessoas passam pela nossa vida.</div>
<div class="slide">Outras… se tornam parte de quem a gente é.</div>
<div class="slide">E você é uma delas.🌟</div>
<div class="slide">Eu admiro profundamente quem você é.</div>
<div class="slide">E acredito muito em você.🥰</div>
<div class="slide">Sua dedicação e inteligência são incríveis.</div>
<div class="slide">Nunca duvide do seu potencial pq eu nunca duvidei.</div>
<div class="slide">Entre todas as certezas que a vida me tirou, uma ainda permanece:</div>
<div class="slide">o amor que sinto por você..</div>
<div class="slide">Eu sempre vou estar torcendo por você.</div>
<div class="slide"><b>E como um mestre Jedi disse uma vez QUE A FORÇA ESTEJA COM VOCÊ.❤️</b></div>

<h3>Nossos momentos 📸</h3>

<div class="carousel">

<div class="slideFoto">
<img src="/img/foto1.jpeg">
<div class="legenda">Nosso primeiro momento</div>
</div>

<div class="slideFoto">
<img src="/img/foto2.jpeg">
<div class="legenda">Seu sorriso ilumina tudo✨</div>
</div>

<div class="slideFoto">
<img src="/img/foto3.jpeg">
<div class="legenda">Momentos que guardo no coração sempre</div>
</div>

<div class="slideFoto">
<img src="/img/foto4.jpeg">
<div class="legenda">Memórias inesquecíveis</div>
</div>

<div class="slideFoto">
<img src="/img/foto5.jpeg">
<div class="legenda">Nossa história continua</div>
</div>

<div class="slideFoto">
<img src="/img/foto6.jpeg">
<div class="legenda">Amo você😍💖</div>
</div>

<div class="slideFoto">
<img src="/img/foto7.jpeg">
<div class="legenda"> Agora eu você e as biritas ✨✨</div>
</div>

</div>

<br><br>
<br><br>
<br><br>
<br><br>
<br><br>
<br><br>
<br><br>
<br><br>
<div style="margin-top:20px">
<p>🎵 Nossa música</p>

<iframe width="320" height="180"
src="https://www.youtube.com/embed/axPThqNrQ50?autoplay=1&loop=1&playlist=axPThqNrQ50"
title="Seu sorriso é tão resplandecente"
frameborder="0"
allow="autoplay"
allowfullscreen>
</iframe>

</div>

</div>

<script>

const scene=new THREE.Scene()

const camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000)

const renderer=new THREE.WebGLRenderer({canvas:document.getElementById("bg")})

renderer.setSize(window.innerWidth,window.innerHeight)

const starGeometry=new THREE.BufferGeometry()

const starCount=5000

const posArray=new Float32Array(starCount*3)

for(let i=0;i<starCount*3;i++){
posArray[i]=(Math.random()-0.5)*2000
}

starGeometry.setAttribute('position',new THREE.BufferAttribute(posArray,3))

const starMaterial=new THREE.PointsMaterial({color:0xffffff})

const stars=new THREE.Points(starGeometry,starMaterial)

scene.add(stars)

camera.position.z=1

function animate(){

requestAnimationFrame(animate)

stars.rotation.y+=0.0005

renderer.render(scene,camera)

}

animate()

</script>

</body>
</html>

"""

if __name__ == "__main__":
    app.run(debug=True)