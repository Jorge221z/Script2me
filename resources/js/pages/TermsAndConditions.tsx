import { useTranslation } from 'react-i18next';

//archivo para las condiciones de uso de la app//

const TermsAndConditions = () => {
    const { t } = useTranslation();

    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray color shadow-md rounded-lg border-gray">
        <h1 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
          <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer">Script2me</span>
          <span className="mx-2 text-gray-400">|</span>
          {t('terms.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('terms.lastUpdated')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
            {t('terms.section1.title')}
          </h2>
          <p className="text-lg text-black dark:text-white">
            {t('terms.section1.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
            {t('terms.section2.title')}
          </h2>
          <p className="text-lg text-black dark:text-white">
            {t('terms.section2.intro')}
          </p>
          <ul className="list-disc ml-6 text-lg text-black dark:text-white">
            <li>{t('terms.section2.li1')}</li>
            <li>{t('terms.section2.li2')}</li>
            <li>{t('terms.section2.li3')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
            {t('terms.section3.title')}
          </h2>
          <ul className="list-disc ml-6 text-lg text-black dark:text-white">
            <li>{t('terms.section3.li1')}</li>
            <li>{t('terms.section3.li2')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
            {t('terms.section4.title')}
          </h2>
          <p className="text-lg text-black dark:text-white">
            {t('terms.section4.p1')}
          </p>
          <p className="text-lg text-black dark:text-white mt-4">
            {t('terms.section4.p2')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
            {t('terms.section5.title')}
          </h2>
          <p className="text-lg text-black dark:text-white">
            {t('terms.section5.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
            {t('terms.section6.title')}
          </h2>
          <ul className="list-disc ml-6 text-lg text-black dark:text-white">
            <li>{t('terms.section6.li1')}</li>
            <li>{t('terms.section6.li2')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
            {t('terms.section7.title')}
          </h2>
          <p className="text-lg text-black dark:text-white">
            {t('terms.section7.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
            {t('terms.section8.title')}
          </h2>
          <p className="text-lg text-black dark:text-white">
            {t('terms.section8.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
            {t('terms.section9.title')}
          </h2>
          <p className="text-lg text-black dark:text-white">
            {t('terms.section9.content')}
          </p>
        </section>
      </div>
    );
};

export default TermsAndConditions;
