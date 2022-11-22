import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Sidepanel from "../components/full-components/Sidepanel";

export default function Home() {
  return (
    <div className="bg-[#1F1F1F] w-full h-full">
        <Sidepanel />
    </div>
    )
}
