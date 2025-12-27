import { Footer } from '@/components/home/footer';
import { Header } from '@/components/home/header';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main className='pt-4 xl:pt-10 flex-1'>{children}</main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
