"use client";

import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import StatBox from "@/components/StatBox";

export default function AboutPage() {
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">About Thoughtca.st</h1>
                <p className="text-lg text-foreground-600">
                    Understanding Australian Highlander performance statistics
                    and methodology
                </p>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-semibold">
                            What is Thoughtca.st?
                        </h2>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <p>
                            Thoughtca.st is a statistical analysis platform for
                            Australian Highlander, a 60 card singleton Magic:
                            The Gathering format. We track deck performance data
                            and provide insights into how individual cards
                            contribute to competitive success.
                        </p>
                        <p>
                            Our platform analyses thousands of deck results to
                            help players make informed decisions about card
                            choices, particularly focusing on pointed cards that
                            have restrictions in the format.
                        </p>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-semibold">
                            Understanding Delta Values
                        </h2>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <p>
                            The{" "}
                            <Chip color="primary" variant="flat" size="sm">
                                Delta
                            </Chip>{" "}
                            value represents how much a card improves or hurts a
                            deck&apos;s win rate compared to the format average.
                        </p>

                        <div className="bg-content2 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">
                                How Delta is Calculated:
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                                <li>
                                    We calculate the win rate of all decks
                                    containing a specific card
                                </li>
                                <li>
                                    We calculate the overall win rate across all
                                    decks in our dataset
                                </li>
                                <li>
                                    Delta = Card Win Rate - Overall Win Rate
                                </li>
                            </ol>
                        </div>

                        <div className="bg-content2 p-4 rounded-lg">
                            <h4 className="font-semibold mb-3">
                                Example Delta Display:
                            </h4>
                            <div className="flex justify-center">
                                <StatBox
                                    topLabel="All Time"
                                    value="+5.18%"
                                    bottomLabel="±1.13%"
                                    countLabel="1138/2096 decks"
                                />
                            </div>
                            <p className="text-sm text-foreground-600 mt-3 text-center">
                                This shows Lightning Bolt has a +5.18% delta
                                with a CI of 1.13%, appearing in 1138 decks out
                                of 2096 that fit the date range.
                            </p>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-semibold">
                            Confidence Intervals
                        </h2>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <p>
                            We use <strong>80% confidence intervals</strong> to
                            provide a range of likely values for each
                            card&apos;s true performance impact.
                        </p>

                        <div className="bg-content2 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">
                                Why 80% Confidence?
                            </h4>
                            <p className="text-sm mb-3">
                                We chose 80% confidence intervals (rather than
                                the more common 95%) due to small sample sizes.
                                This level balances providing useful insights
                                while avoiding overly wide intervals that occur
                                with higher confidence levels in limited data
                                scenarios.
                            </p>
                        </div>

                        <div className="bg-content2 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">
                                How to Interpret Confidence Intervals:
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <strong>Narrow intervals:</strong> We have
                                    more confidence in the delta value (larger
                                    sample size)
                                </div>
                                <div>
                                    <strong>Wide intervals:</strong> Less
                                    certainty in the exact value (smaller sample
                                    size or high variance)
                                </div>
                                <div>
                                    <strong>Interval crosses zero:</strong> The
                                    card&apos;s impact may not be statistically
                                    significant
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-semibold">
                            Statistical Methodology
                        </h2>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <div className="bg-content2 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">
                                Our Calculations Use:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>
                                    <strong>Sample Mean:</strong> Average win
                                    rate for decks containing the card
                                </li>
                                <li>
                                    <strong>Standard Error:</strong> Measures
                                    uncertainty based on sample size and
                                    variance
                                </li>
                                <li>
                                    <strong>T-Distribution:</strong> Accounts
                                    for smaller sample sizes with appropriate
                                    degrees of freedom
                                </li>
                                <li>
                                    <strong>80% Confidence Level:</strong> Uses
                                    t-critical value for 80% confidence interval
                                </li>
                            </ul>
                        </div>

                        <p className="text-sm text-foreground-600">
                            <strong>Formula:</strong> CI = Sample Mean ±
                            (t-critical × Standard Error)
                        </p>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-semibold">
                            Data Sources & Updates
                        </h2>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <p>
                            Our deck data is scraped from the 7PointEventResults
                            Moxfield account, with many thanks to Graham King
                            (and other contributors) for their efforts in
                            uploading and maintaining this important repository
                            of decklists. This website is built on top of their
                            hard work.
                        </p>

                        <div className="bg-content2 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">
                                Points List Source:
                            </h4>
                            <p className="text-sm">
                                We automatically sync with the Australian
                                Highlander points list maintained at{" "}
                                <a
                                    href="https://github.com/Fryyyyy/decklist"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    github.com/Fryyyyy/decklist
                                </a>
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
