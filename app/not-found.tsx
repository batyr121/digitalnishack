import { PageIntro, Button } from '@/components/ui';
export default function NotFound() {
  return (
    <div className="container page-body">
      <PageIntro
        label="404 / OFF THE MAP"
        title="A connection\nnot found."
        description="This page or verified certificate is not available."
      />
      <Button href="/">Back to the forum</Button>
    </div>
  );
}
