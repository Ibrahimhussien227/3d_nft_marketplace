import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

import { Banner, CreaterCard, Loader, NFTCard, SearchBar } from "../components";
import images from "../assets";
// import { makeId } from "../utils/makeId";
import { NFTContext } from "../context/NFTContext";
import { getTopCreators } from "../utils/getTopCreators";

const Home = () => {
  const { fetchNFTs } = useContext(NFTContext);
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hideButtons, setHideButtons] = useState(false);
  const [activeSelect, setActiveSelect] = useState("Recently added");
  const { theme } = useTheme();
  const parentRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchNFTs().then((items) => {
      setNfts(items);
      setNftsCopy(items);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const sortNfts = [...nfts];

    switch (activeSelect) {
      case "Price (low to high)":
        setNfts(sortNfts.sort((a, b) => a.price - b.price));
        break;

      case "Price (high to low)":
        setNfts(sortNfts.sort((a, b) => b.price - a.price));
        break;

      case "Recently added":
        setNfts(sortNfts.sort((a, b) => b.tokenId - a.tokenId));
        break;

      default:
        setNfts(nftsCopy);
        break;
    }
  }, [activeSelect]);

  const onHandleSearch = (value) => {
    const filteredNfts = nfts.filter(({ title }) =>
      title.toLowerCase().includes(value.toLowerCase())
    );

    if (filteredNfts.length) {
      setNfts(filteredNfts);
    } else {
      setNfts(nftsCopy);
    }
  };

  const onClearSearch = () => {
    if (nfts.length && nftsCopy.length) {
      setNfts(nftsCopy);
    }
  };

  const handleScroll = (direction) => {
    const { current } = scrollRef;

    const scrollAmount = window.innerWidth > 1800 ? 270 : 210;

    if (direction === "left") {
      current.scrollLeft -= scrollAmount;
    } else {
      current.scrollLeft += scrollAmount;
    }
  };

  const isScrollable = () => {
    const { current } = scrollRef;
    const { current: parent } = parentRef;

    if (current?.scrollWidth >= parent?.offsetWidth) {
      setHideButtons(false);
    } else {
      setHideButtons(true);
    }
  };

  useEffect(() => {
    isScrollable();
    window.addEventListener("resize", isScrollable);

    return () => {
      window.removeEventListener("resize", isScrollable);
    };
  });

  const topCreators = getTopCreators(nftsCopy);

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-full minmd:w-4/5">
        <Banner
          name={
            <>
              Discover, collect, and sell <br /> extraordinary 3D NFTs
            </>
          }
          childStyles="md:text-4xl sm:text-2xl xs:text-xl text-left"
          parentStyles="justify-start mb-7 h-72 sm:h-60 p-12 xs:p-4 xs:h-44 rounded-3xl"
        />

        {!isLoading && !nfts.length ? (
          <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0">
            That&apos;s weird... No NFTs for sale!
          </h1>
        ) : isLoading ? (
          <Loader />
        ) : (
          <>
            <div>
              <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0">
                Top Sellers
              </h1>
              <div
                className="relative flex-1 max-w-full flex mt-3"
                ref={parentRef}
              >
                <div
                  className="flex flex-row w-max overflow-x-scroll no-scrollbar select-none"
                  ref={scrollRef}
                >
                  {/* {[5, 6, 7, 8, 9].map((i) => (
                <CreaterCard
                  key={`creator-${i}`}
                  rank={i}
                  creatorImage={images[`creator${i}`]}
                  creatorName={`0x${makeId(3)}...${makeId(4)}`}
                  creatorEths={10 - i * 0.5}
                />
              ))} */}
                  {topCreators.map((creator, i) => (
                    <CreaterCard
                      key={creator.seller}
                      rank={i + 1}
                      creatorImage={images[`creator${i + 1}`]}
                      creatorAddress={creator.seller}
                      creatorEths={creator.sum}
                    />
                  ))}
                  {!hideButtons && (
                    <>
                      <div
                        onClick={() => handleScroll("left")}
                        className="absolute w-8 h-8 minlg:w-12 minlg:h-12 top-45 cursor-pointer left-0"
                      >
                        <Image
                          src={images.left}
                          alt="left_arrow"
                          fill
                          sizes="true"
                          className={
                            theme === "light" ? "filter invert" : undefined
                          }
                        />
                      </div>
                      <div
                        onClick={() => handleScroll("right")}
                        className="absolute w-8 h-8 minlg:w-12 minlg:h-12 top-45 cursor-pointer right-0"
                      >
                        <Image
                          src={images.right}
                          fill
                          sizes="true"
                          alt="right_arrow"
                          className={
                            theme === "light" ? "filter invert" : undefined
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="flexBetween mx-4 xs:mx-0 minlg:mx-8 sm:flex-col sm:items-start">
                <h1 className="flex-1 font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold sm:mb-4">
                  Hot NFTs
                </h1>
                <div className="flex-2 sm:w-full flex flex-row sm:flex-col mr-24">
                  <SearchBar
                    activeSelect={activeSelect}
                    setActiveSelect={setActiveSelect}
                    handleSearch={onHandleSearch}
                    clearSearch={onClearSearch}
                  />
                </div>
              </div>

              <div className="mt-3 w-full flex flex-wrap justify-start md:justify-center xs:justify-start gap-2">
                {nfts.map((nft) => (
                  <NFTCard key={nft.tokenId} nft={nft} />
                ))}
                {/* {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <NFTCard
                    key={`nft-${i}`}
                    nft={{
                      i,
                      name: `Nifty NFT ${i}`,
                      price: (10 - i * 0.534).toFixed(2),
                      seller: `0x${makeid(3)}...${makeid(4)}`,
                      owner: `0x${makeid(3)}...${makeid(4)}`,
                      description: 'Cool NFT on Sale',
                    }}
                  />
                ))} */}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
