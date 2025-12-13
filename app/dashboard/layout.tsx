import { Header } from '@/components/home/header';
import { Footer } from '@/components/home/footer';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='min-h-screen'>
      <Header />
      <main className='pt-4 xl:pt-10'>{children}</main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
