import Brand from "@/components/Brand";
import NavPill from "@/components/NavPill";
import AkunIndikator from "@/components/AkunIndikator";

export default function HeaderSticky() {
  return (
    <>
      <div className="header-baris-atas">
        <Brand />
        <AkunIndikator />
      </div>
      <NavPill />
    </>
  );
}