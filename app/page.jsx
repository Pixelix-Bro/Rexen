import About from '@/components/About/About'
import FramePreload from '@/components/Hero/FramePreload'
import Hero from '@/components/Hero/Hero'
import Contact from '../components/contact/Contact'
import FAQ from '../components/FAQ/FAQ'
import Footer from '../components/Footer/Footer'
import WhyUs from '../components/Whyus/Whyus'

const Home = () => {
  return (
    <div>
      <FramePreload />
      <Hero />
      <About />
      <WhyUs />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  )
}

export default Home
